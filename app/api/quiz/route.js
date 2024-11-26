import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        
        // Validate required fields
        if (!data.numbers || !Array.isArray(data.numbers) || data.numbers.length === 0) {
            return NextResponse.json(
                { success: false, error: "Numbers array is required and must not be empty" },
                { status: 400 }
            );
        }

        if (!data.operator) {
            return NextResponse.json(
                { success: false, error: "Operator is required" },
                { status: 400 }
            );
        }

        // Create quiz without passing _id (let MongoDB generate it)
        const quiz = new Quiz({
            numbers: data.numbers,
            operator: data.operator,
            result: data.result,
            speed: data.speed || 0 // Default to 0 if not provided
        });
        
        const savedQuiz = await quiz.save();
        return NextResponse.json({ success: true, quiz: savedQuiz });
    } catch (error) {
        console.error('Error saving quiz:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to create quiz",
                details: error.message 
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(10); // Get last 10 quizzes
            
        return NextResponse.json({ success: true, quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
