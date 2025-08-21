import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/database';
import { SubmitRatingRequest } from '../types';

export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, rating }: SubmitRatingRequest = req.body;
    const userId = req.user!.id;

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user is trying to rate their own store
    if (store.ownerId === userId) {
      return res.status(400).json({ message: 'You cannot rate your own store' });
    }

    // Upsert rating (create or update)
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      },
      update: {
        rating
      },
      create: {
        userId,
        storeId,
        rating
      },
      include: {
        user: {
          select: { name: true }
        },
        store: {
          select: { name: true }
        }
      }
    });

    res.json({
      message: 'Rating submitted successfully',
      rating: ratingRecord
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserRatings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        store: {
          select: { id: true, name: true, address: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ ratings });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};