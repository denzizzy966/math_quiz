import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        console.log('Received quiz data:', data);

        // Transform the rows data into the format our schema expects
        const numbers = data.rows.map(row => row.number);
        const operator = data.rows[data.rows.length - 1].operator; // Get the last operator

        // Validate transformed data
        if (!numbers || numbers.length === 0) {
            return NextResponse.json(
                { success: false, error: "Numbers array is required and must not be empty" },
                { status: 400 }
            );
        }

        if (!operator) {
            return NextResponse.json(
                { success: false, error: "Operator is required" },
                { status: 400 }
            );
        }

        // Create quiz with transformed data
        const quiz = new Quiz({
            numbers: numbers,
            operator: operator,
            result: data.result,
            speed: data.speed || 0
        });
        
        console.log('Saving quiz:', quiz);
        const savedQuiz = await quiz.save();
        console.log('Saved quiz:', savedQuiz);
        
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
