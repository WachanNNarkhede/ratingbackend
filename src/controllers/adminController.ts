import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/database';
import { hashPassword } from '../utils/password';
import { CreateUserRequest, DashboardStats } from '../types';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ]);

    const stats: DashboardStats = {
      totalUsers,
      totalStores,
      totalRatings
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search, 
      role, 
      sortBy = 'name', 
      sortOrder = 'asc',
      page = '1',
      limit = '10'
    } = req.query;

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (role && role !== 'ALL') {
      whereClause.role = role;
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          store: {
            select: {
              id: true,
              name: true,
              ratings: {
                select: { rating: true }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const usersWithRating = users.map(user => {
      let averageRating = null;
      
      if (user.store && user.store.ratings.length > 0) {
        const totalRating = user.store.ratings.reduce((sum, rating) => sum + rating.rating, 0);
        averageRating = Math.round((totalRating / user.store.ratings.length) * 10) / 10;
      }

      return {
        ...user,
        averageRating,
        store: user.store ? { id: user.store.id, name: user.store.name } : null
      };
    });

    res.json({
      users: usersWithRating,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, address, role = 'NORMAL_USER' }: CreateUserRequest = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllStores = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search, 
      sortBy = 'name', 
      sortOrder = 'asc',
      page = '1',
      limit = '10'
    } = req.query;

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [stores, totalCount] = await Promise.all([
      prisma.store.findMany({
        where: whereClause,
        include: {
          owner: {
            select: { name: true, email: true }
          },
          ratings: {
            select: { rating: true }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.store.count({ where: whereClause })
    ]);

    const storesWithRating = stores.map(store => {
      const totalRatings = store.ratings.length;
      const averageRating = totalRatings > 0 
        ? store.ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      };
    });

    res.json({
      stores: storesWithRating,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};