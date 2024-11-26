import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const rawData = await request.json();
        console.log('Raw data received:', rawData);

        // Remove any ID-related fields that might cause BSON errors
        const cleanData = Object.fromEntries(
            Object.entries(rawData).filter(([key]) => !key.includes('id') && !key.includes('_id'))
        );
        console.log('Cleaned data:', cleanData);

        // Extract and validate numbers from rows
        const numbers = cleanData.rows?.map(row => Number(row.number))
            .filter(num => !isNaN(num)) || [];

        // Find the last operator in the rows
        const operator = cleanData.rows?.slice()
            .reverse()
            .find(row => row.operator)?.operator;

        // Create the quiz data object with only the required fields
        const quizData = {
            numbers,
            operator,
            result: Number(cleanData.result) || 0,
            speed: Number(cleanData.speed) || 0
        };
        console.log('Transformed quiz data:', quizData);

        // Validate before creating the document
        if (!numbers.length) {
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: "Quiz must have at least one number"
            }, { status: 400 });
        }

        if (!operator || !['+', '-', '*', '/'].includes(operator)) {
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: "Valid operator is required (+, -, *, /)"
            }, { status: 400 });
        }

        // Create and save the quiz with clean data
        const quiz = new Quiz(quizData);
        console.log('Quiz model before save:', quiz);
        
        const savedQuiz = await quiz.save();
        console.log('Saved quiz:', savedQuiz);

        return NextResponse.json({
            success: true,
            quiz: savedQuiz
        });
    } catch (error) {
        console.error('Full error object:', error);
        
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

        if (error.name === 'BSONError') {
            return NextResponse.json({
                success: false,
                error: "Data format error",
                details: "Invalid document format. Please check your input data."
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
