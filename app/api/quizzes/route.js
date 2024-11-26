import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const requestData = await request.json();
        console.log('Raw request data:', requestData);

        // Validate input
        if (!requestData.rows || !Array.isArray(requestData.rows) || requestData.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "Quiz must have at least one row"
            }, { status: 400 });
        }

        // Create a completely new object with only the fields we want
        const quizData = {
            // Extract numbers from rows
            numbers: requestData.rows
                .map(row => Number(row.number))
                .filter(num => !isNaN(num)),
            
            // Get only the last operator
            operator: requestData.rows[requestData.rows.length - 1].operator,
            
            // Get result and speed
            result: Number(requestData.result),
            speed: Number(requestData.speed || 0)
        };

        console.log('Transformed quiz data:', quizData);

        // Validate the transformed data
        if (quizData.numbers.length === 0) {
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

        // Create a new Quiz instance with only our cleaned data
        const quiz = new Quiz(quizData);
        console.log('Quiz before save:', quiz);
        
        const savedQuiz = await quiz.save();
        console.log('Saved quiz:', savedQuiz);

        return NextResponse.json({ 
            success: true, 
            quiz: savedQuiz 
        });
    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        if (error.name === 'ValidationError') {
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: Object.values(error.errors)
                    .map(err => err.message)
                    .join(', ')
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
            
        return NextResponse.json({ 
            success: true, 
            quizzes 
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to fetch quizzes",
            details: error.message 
        }, { status: 500 });
    }
}
