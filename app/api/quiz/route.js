import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        console.log('Received data:', data);

        // Destructure only the fields we need, explicitly ignoring id
        const { rows, result, speed } = data;
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: "Quiz must have at least one row"
            }, { status: 400 });
        }

        // Extract numbers and last operator
        const numbers = rows.map(row => Number(row.number));
        const lastOperator = rows[rows.length - 1].operator;

        // Create quiz data with only the fields defined in our schema
        const quizData = {
            numbers,
            operator: lastOperator,
            result: Number(result),
            speed: Number(speed)
        };

        console.log('Transformed quiz data:', quizData);

        // Create and save the quiz
        const quiz = new Quiz(quizData);
        const savedQuiz = await quiz.save();
        
        return NextResponse.json({
            success: true,
            quiz: savedQuiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        
        if (error.name === 'ValidationError') {
            const errorDetails = Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
                
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: errorDetails
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: "Failed to create quiz",
            details: error.message
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
            
        return NextResponse.json({ success: true, quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch quizzes",
            details: error.message
        }, { status: 500 });
    }
}
