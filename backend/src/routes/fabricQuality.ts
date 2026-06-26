import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const Schema = z.object({
  item_description: z.string().min(1),
  weight: z.number().positive(),
  destination_sector: z.string().min(1),
  observations: z.string().optional(),
  defect_image_url: z.string().optional(),
  employee_name: z.string().min(1),
  inspection_date: z.string(),
});

router.get('/inspections', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const items = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
  return res.json(items);
});

router.get('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const item = await prisma.fabricQualityInspection.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!item) return res.status(404).json({ error: 'Inspeção não encontrada' });
  return res.json(item);
});

router.post('/inspections', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;

    const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' } });
    const num = last ? parseInt(last.inspectionNumber.split('-')[1]) + 1 : 1;
    const inspectionNumber = `INS-${String(num).padStart(3, '0')}`;

    await prisma.fabricQualityInspection.create({ data: { inspectionNumber, itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date } });
    return res.status(201).json({ success: true, inspection_number: inspectionNumber });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar inspeção' });
  }
});

router.put('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    await prisma.fabricQualityInspection.update({ where: { id: parseInt(req.params.id) }, data: { itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar inspeção' });
  }
});

router.delete('/inspections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.fabricQualityInspection.delete({ where: { id: parseInt(req.params.id) } });
  return res.json({ success: true });
});

export default router;
