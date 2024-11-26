import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        console.log('Received quiz data:', data);

        // Remove any _id field if it exists to let MongoDB generate it
        const { _id, ...quizData } = data;

        // Transform rows data into the expected format
        let transformedData = {};
        
        if (data.rows && Array.isArray(data.rows)) {
            // Extract numbers from rows
            transformedData.numbers = data.rows
                .filter(row => row.number !== undefined && row.number !== null)
                .map(row => Number(row.number));

            // Get the operator from the last row that has one
            const operatorRow = [...data.rows].reverse().find(row => row.operator);
            transformedData.operator = operatorRow?.operator;
        }

        // Add other required fields
        transformedData.result = Number(data.result || 0);
        transformedData.speed = Number(data.speed || 0);

        // Validate the transformed data
        if (!transformedData.numbers || transformedData.numbers.length === 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "Quiz must have at least one number"
                },
                { status: 400 }
            );
        }

        if (!transformedData.operator || !['+', '-', '*', '/'].includes(transformedData.operator)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "Valid operator is required (+, -, *, /)"
                },
                { status: 400 }
            );
        }

        // Create new quiz document without any _id field
        const quiz = new Quiz(transformedData);
        
        console.log('Attempting to save quiz:', quiz);
        const savedQuiz = await quiz.save();
        console.log('Successfully saved quiz:', savedQuiz);
        
        return NextResponse.json({ 
            success: true, 
            quiz: savedQuiz 
        });
    } catch (error) {
        console.error('Error saving quiz:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Validation error",
                    details: Object.values(error.errors)
                        .map(err => err.message)
                        .join(', ')
                },
                { status: 400 }
            );
        }

        // Handle BSON errors
        if (error.name === 'BSONError') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid data format",
                    details: "Unable to process the quiz data format"
                },
                { status: 400 }
            );
        }

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
            .limit(10)
            .lean();
            
        return NextResponse.json({ 
            success: true, 
            quizzes 
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to fetch quizzes",
                details: error.message 
            },
            { status: 500 }
        );
    }
}
