import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { extractArticle } from '../services/article-extractor.service';

export const createLink = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { url, categoryId } = req.body;
    const userId = req.user!.id;

    // Extract article metadata and content
    const articleData = await extractArticle(url);

    const link = await prisma.link.create({
      data: {
        url,
        title: articleData.title,
        description: articleData.description,
        imageUrl: articleData.image,
        content: articleData.content,
        categoryId: categoryId || null,
        userId,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
};

export const getLinks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { categoryId, isRead, search } = req.query;

    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { url: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const links = await prisma.link.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(links);
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to get links' });
  }
};

export const getLink = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({ error: 'Failed to get link' });
  }
};

export const updateLink = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.id;
    const { isRead, categoryId } = req.body;

    const link = await prisma.link.findFirst({
      where: { id, userId },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const updatedLink = await prisma.link.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? isRead : link.isRead,
        categoryId: categoryId !== undefined ? categoryId : link.categoryId,
      },
      include: {
        category: true,
      },
    });

    res.json(updatedLink);
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
};

export const deleteLink = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const link = await prisma.link.findFirst({
      where: { id, userId },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
};
