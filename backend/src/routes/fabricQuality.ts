import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const fabricQualityRouter = Router();
fabricQualityRouter.use(authMiddleware);

const Schema = z.object({
  item_description: z.string().min(1),
  weight: z.number(),
  destination_sector: z.string(),
  observations: z.string().optional(),
  defect_image_url: z.string().optional(),
  employee_name: z.string(),
  inspection_date: z.string(),
});

async function nextInspectionNumber() {
  const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' } });
  if (!last) return 'INS-001';
  const n = parseInt(last.inspectionNumber.split('-')[1]) + 1;
  return `INS-${String(n).padStart(3, '0')}`;
}

fabricQualityRouter.get('/inspections', async (_req, res) => {
  const list = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
  return res.json(list);
});

fabricQualityRouter.get('/inspections/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const item = await prisma.fabricQualityInspection.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ error: 'Inspeção não encontrada' });
  return res.json(item);
});

fabricQualityRouter.post('/inspections', async (req, res) => {
  const v = Schema.parse(req.body);
  const inspectionNumber = await nextInspectionNumber();
  const record = await prisma.fabricQualityInspection.create({
    data: { inspectionNumber, itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date },
  });
  return res.status(201).json({ success: true, inspection_number: inspectionNumber, id: record.id });
});

fabricQualityRouter.put('/inspections/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const v = Schema.parse(req.body);
  await prisma.fabricQualityInspection.update({
    where: { id },
    data: { itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date },
  });
  return res.json({ success: true });
});
