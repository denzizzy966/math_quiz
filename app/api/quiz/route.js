import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        console.log('Received quiz data:', data);

        // Input validation
        if (!data.rows || !Array.isArray(data.rows) || data.rows.length === 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "Quiz must have at least one row of data"
                },
                { status: 400 }
            );
        }

        // Extract and validate numbers
        const numbers = data.rows
            .filter(row => row.number !== undefined && row.number !== null)
            .map(row => Number(row.number));

        if (!numbers.length) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "No valid numbers found in quiz data"
                },
                { status: 400 }
            );
        }

        // Get operator from the last row
        const lastRow = data.rows[data.rows.length - 1];
        const operator = lastRow?.operator;

        if (!operator || !['+', '-', '*', '/'].includes(operator)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "Invalid or missing operator. Must be one of: +, -, *, /"
                },
                { status: 400 }
            );
        }

        // Validate result and speed
        const result = Number(data.result);
        const speed = Number(data.speed);

        if (isNaN(result)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "Result must be a valid number"
                },
                { status: 400 }
            );
        }

        if (isNaN(speed) || speed < 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid input",
                    details: "Speed must be a non-negative number"
                },
                { status: 400 }
            );
        }

        // Create quiz with validated data
        const quiz = new Quiz({
            numbers,
            operator,
            result,
            speed
        });
        
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
        
        // Using the indexed createdAt field for efficient sorting
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(); // Use lean() for better performance on read-only data
            
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
