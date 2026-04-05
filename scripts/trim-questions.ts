import { db } from '../src/lib/db';

async function trim() {
  // Get counts
  const physics = await db.question.count({ where: { subject: 'Physics' } });
  const chemistry = await db.question.count({ where: { subject: 'Chemistry' } });
  const biology = await db.question.count({ where: { subject: 'Biology' } });
  
  console.log(`Before trim - Physics: ${physics}, Chemistry: ${chemistry}, Biology: ${biology}, Total: ${physics + chemistry + biology}`);
  
  // Trim Physics to 45 (delete last 3)
  if (physics > 45) {
    const excess = await db.question.findMany({ where: { subject: 'Physics' }, orderBy: { id: 'desc' }, take: physics - 45 });
    const ids = excess.map(q => q.id);
    await db.question.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${ids.length} excess Physics questions`);
  }
  
  // Trim Biology to 90 (delete last 3)
  if (biology > 90) {
    const excess = await db.question.findMany({ where: { subject: 'Biology' }, orderBy: { id: 'desc' }, take: biology - 90 });
    const ids = excess.map(q => q.id);
    await db.question.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${ids.length} excess Biology questions`);
  }
  
  // Verify
  const p2 = await db.question.count({ where: { subject: 'Physics' } });
  const c2 = await db.question.count({ where: { subject: 'Chemistry' } });
  const b2 = await db.question.count({ where: { subject: 'Biology' } });
  console.log(`After trim - Physics: ${p2}, Chemistry: ${c2}, Biology: ${b2}, Total: ${p2 + c2 + b2}`);
}

trim().catch(console.error);
