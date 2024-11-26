import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request: Request) {
  await dbConnect();
  const quiz = await Quiz.create(await request.json());
  return NextResponse.json(quiz);
}

export async function GET() {
  await dbConnect();
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
  return NextResponse.json(quizzes);
}

