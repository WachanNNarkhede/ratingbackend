import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/database';
import { CreateStoreRequest, StoreWithRating } from '../types';

export const getStores = async (req: AuthRequest, res: Response) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user!.id;

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        owner: {
          select: { name: true, email: true }
        }
      },
      orderBy
    });

    const storesWithRating: StoreWithRating[] = stores.map((store: { ratings: any[]; id: any; name: any; email: any; address: any; }) => {
      const totalRatings = store.ratings.length;
      const averageRating = totalRatings > 0 
        ? store.ratings.reduce((sum: any, rating: { rating: any; }) => sum + rating.rating, 0) / totalRatings 
        : 0;
      
      const userRating = store.ratings.find((rating: { userId: string; }) => rating.userId === userId);

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Math.round(averageRating * 10) / 10,
        userRating: userRating?.rating,
        totalRatings
      };
    });

    res.json({ stores: storesWithRating });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createStore = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, address, ownerEmail }: CreateStoreRequest = req.body;

    // Find the owner user
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner user not found' });
    }

    // Check if user already owns a store
    const existingStore = await prisma.store.findUnique({
      where: { ownerId: owner.id }
    });

    if (existingStore) {
      return res.status(409).json({ message: 'User already owns a store' });
    }

    // Update user role to STORE_OWNER
    await prisma.user.update({
      where: { id: owner.id },
      data: { role: 'STORE_OWNER' }
    });

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: owner.id
      },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStoreDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        owner: {
          select: { name: true, email: true }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const totalRatings = store.ratings.length;
    const averageRating = totalRatings > 0 
      ? store.ratings.reduce((sum: any, rating: { rating: any; }) => sum + rating.rating, 0) / totalRatings 
      : 0;

    res.json({
      store: {
        ...store,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    });
  } catch (error) {
    console.error('Get store details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyStore = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const totalRatings = store.ratings.length;
    const averageRating = totalRatings > 0 
      ? store.ratings.reduce((sum: any, rating: { rating: any; }) => sum + rating.rating, 0) / totalRatings 
      : 0;

    res.json({
      store: {
        ...store,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    });
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};