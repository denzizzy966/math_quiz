import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

interface QuizRow {
    number: number;
    operator?: string;
}

interface QuizRequest {
    rows: QuizRow[];
    result: number;
    speed: number;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        
        const requestData: QuizRequest = await request.json();
        console.log('Raw request data:', requestData);

        // Validate input structure
        if (!requestData.rows?.length) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "Quiz must have at least one row"
            }, { status: 400 });
        }

        // Create a clean quiz object with only required fields
        const quizData = {
            numbers: requestData.rows
                .map(row => Number(row.number))
                .filter(num => !isNaN(num)),
            operator: requestData.rows[requestData.rows.length - 1].operator,
            result: Number(requestData.result),
            speed: Number(requestData.speed || 0)
        };

        console.log('Transformed quiz data:', quizData);

        // Validate transformed data
        if (!quizData.numbers.length) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "No valid numbers found in quiz data"
            }, { status: 400 });
        }

        if (!quizData.operator || !['+', '-', '*', '/'].includes(quizData.operator)) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "Valid operator is required (+, -, *, /)"
            }, { status: 400 });
        }

        // Create and save quiz
        const savedQuiz = await Quiz.create(quizData);
        console.log('Saved quiz:', savedQuiz);

        return NextResponse.json({ 
            success: true, 
            quiz: savedQuiz 
        });
    } catch (error: any) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: Object.values(error.errors)
                    .map((err: any) => err.message)
                    .join(', ')
            }, { status: 400 });
        }

        // Handle other errors
        return NextResponse.json({ 
            success: false, 
            error: "Failed to create quiz",
            details: error.message 
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
            
        return NextResponse.json({ 
            success: true, 
            quizzes 
        });
    } catch (error: any) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to fetch quizzes",
            details: error.message 
        }, { status: 500 });
    }
}
