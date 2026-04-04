import { db } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

interface QuestionData {
  subject: string;
  topic: string;
  difficulty: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

const REQUIRED_FIELDS = [
  'subject', 'topic', 'difficulty', 'questionText',
  'optionA', 'optionB', 'optionC', 'optionD',
  'correctAnswer', 'explanation',
] as const;

function isValidQuestion(q: unknown): q is QuestionData {
  if (!q || typeof q !== 'object') return false;
  return REQUIRED_FIELDS.every(
    (field) => typeof (q as Record<string, unknown>)[field] === 'string'
  );
}

/**
 * Extract the actual JSON content from a z-ai CLI output file.
 * The z-ai CLI saves the full API response as { choices: [{ message: { content: "..." } }] }.
 * If the file is a _clean.json (pre-processed), it's a plain JSON array.
 */
function extractJsonArray(rawContent: string): unknown[] {
  let parsed: any;

  // Try parsing directly first (for _clean.json files)
  try {
    parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not a direct JSON array, try extracting from z-ai response
  }

  // Try z-ai response format: { choices: [{ message: { content: "..." } }] }
  try {
    parsed = JSON.parse(rawContent);
    if (parsed?.choices?.[0]?.message?.content) {
      const content = parsed.choices[0].message.content;
      // The content itself may have markdown wrapping
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      const inner = JSON.parse(cleaned);
      if (Array.isArray(inner)) return inner;
    }
  } catch {
    // Fallback: try to find JSON array in raw content
    const match = rawContent.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const inner = JSON.parse(match[0]);
        if (Array.isArray(inner)) return inner;
      } catch {
        // Give up
      }
    }
  }

  return [];
}

function loadBatch(filePath: string, cleanFilePath: string): QuestionData[] {
  // Prefer clean version if it exists
  const fileToRead = fs.existsSync(cleanFilePath) ? cleanFilePath : filePath;
  const raw = fs.readFileSync(fileToRead, 'utf-8');
  const items = extractJsonArray(raw);

  const valid: QuestionData[] = [];
  for (const item of items) {
    if (isValidQuestion(item)) {
      valid.push(item);
    } else {
      console.warn(`  Skipping invalid question: ${JSON.stringify(item).slice(0, 100)}...`);
    }
  }

  return valid;
}

async function seed() {
  console.log('Starting question seeding...\n');

  const dbDir = '/home/z/my-project/db';
  const batches = [
    'physics_batch1.json', 'physics_batch2.json', 'physics_batch3.json',
    'chemistry_batch1.json', 'chemistry_batch2.json', 'chemistry_batch3.json',
    'biology_batch1.json', 'biology_batch2.json', 'biology_batch3.json',
    'biology_batch4.json', 'biology_batch5.json', 'biology_batch6.json',
  ];

  const allQuestions: QuestionData[] = [];
  const seen = new Set<string>();

  for (const batch of batches) {
    const filePath = path.join(dbDir, batch);
    const cleanPath = filePath.replace('.json', '_clean.json');

    try {
      const questions = loadBatch(filePath, cleanPath);
      let added = 0;
      for (const q of questions) {
        const key = q.questionText.trim();
        if (seen.has(key)) {
          console.warn(`  Skipping duplicate in ${batch}: "${key.slice(0, 60)}..."`);
          continue;
        }
        seen.add(key);
        allQuestions.push(q);
        added++;
      }
      console.log(`  ${batch}: ${questions.length} loaded, ${added} unique`);
    } catch (e) {
      console.error(`  ERROR loading ${batch}:`, e);
    }
  }

  console.log(`\nTotal unique questions: ${allQuestions.length}`);

  // Count by subject
  const counts: Record<string, number> = {};
  for (const q of allQuestions) {
    counts[q.subject] = (counts[q.subject] || 0) + 1;
  }
  console.log('By subject:');
  for (const [subj, count] of Object.entries(counts).sort()) {
    console.log(`  ${subj}: ${count}`);
  }

  // Validate correctAnswer format
  const invalidAnswers = allQuestions.filter(
    (q) => !['A', 'B', 'C', 'D'].includes(q.correctAnswer)
  );
  if (invalidAnswers.length > 0) {
    console.warn(`\nWarning: ${invalidAnswers.length} questions have invalid correctAnswer values`);
  }

  // Clear existing data (respect FK constraints)
  console.log('\nClearing existing data...');
  await db.examAnswer.deleteMany();
  await db.examSession.deleteMany();
  await db.question.deleteMany();

  // Insert in batches of 30
  console.log('Inserting questions...');
  for (let i = 0; i < allQuestions.length; i += 30) {
    const chunk = allQuestions.slice(i, i + 30);
    await db.question.createMany({ data: chunk });
    console.log(`  Inserted ${Math.min(i + 30, allQuestions.length)}/${allQuestions.length}`);
  }

  // Verify
  const totalInDb = await db.question.count();
  console.log(`\nTotal questions in DB: ${totalInDb}`);

  // Count by subject in DB
  const dbCounts = await db.question.groupBy({
    by: ['subject'],
    _count: true,
  });
  console.log('Database breakdown:');
  for (const row of dbCounts.sort((a, b) => a.subject.localeCompare(b.subject))) {
    console.log(`  ${row.subject}: ${row._count}`);
  }

  console.log('\nSeeding complete!');
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
