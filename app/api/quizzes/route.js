import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB');
        
        const data = await request.json();
        console.log('Received quiz data:', data);
        
        const quiz = new Quiz({
            numbers: data.numbers,
            operator: data.operator,
            result: data.result,
            speed: data.speed
        });
        
        console.log('Created quiz object:', quiz);
        const savedQuiz = await quiz.save();
        console.log('Saved quiz:', savedQuiz);
        
        return NextResponse.json({ success: true, quiz: savedQuiz });
    } catch (error) {
        console.error('Detailed error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                details: {
                    name: error.name,
                    stack: error.stack
                }
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB');
        
        console.log('Fetching quizzes...');
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(10);
        console.log('Found quizzes:', quizzes);
            
        return NextResponse.json({ success: true, quizzes });
    } catch (error) {
        console.error('Detailed error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                details: {
                    name: error.name,
                    stack: error.stack
                }
            },
            { status: 500 }
        );
    }
}
