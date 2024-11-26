import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const quiz = await Quiz.create(body);
    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error('Failed to create quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
    return NextResponse.json(quizzes);
  } catch (error: any) {
    console.error('Failed to fetch quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes', details: error.message },
      { status: 500 }
    );
  }
}
