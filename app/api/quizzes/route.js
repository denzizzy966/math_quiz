import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Quiz from '../../../models/Quiz';

export async function POST(request) {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB');
        
        const requestData = await request.json();
        console.log('Received raw quiz data:', requestData);

        // Remove any id fields from the incoming data
        const { id, _id, ...data } = requestData;
        console.log('Cleaned quiz data:', data);

        if (!data.rows || !Array.isArray(data.rows) || data.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "Quiz must have at least one row of data"
            }, { status: 400 });
        }

        // Transform the rows data into the format our schema expects
        const numbers = data.rows.map(row => Number(row.number))
            .filter(num => !isNaN(num));
            
        if (numbers.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "No valid numbers found in quiz data"
            }, { status: 400 });
        }

        // Get operator from the last row
        const operator = data.rows[data.rows.length - 1].operator;
        if (!operator || !['+', '-', '*', '/'].includes(operator)) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: "Valid operator is required (+, -, *, /)"
            }, { status: 400 });
        }

        // Create quiz object with clean data
        const quizData = {
            numbers,
            operator,
            result: Number(data.result),
            speed: Number(data.speed || 0)
        };
        
        console.log('Creating quiz with data:', quizData);
        const quiz = new Quiz(quizData);
        
        console.log('Saving quiz...');
        const savedQuiz = await quiz.save();
        console.log('Successfully saved quiz:', savedQuiz);
        
        return NextResponse.json({ 
            success: true, 
            quiz: savedQuiz 
        });
    } catch (error) {
        console.error('Error saving quiz:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Handle mongoose validation errors
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
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to MongoDB');
        
        console.log('Fetching quizzes...');
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();  // Use lean() for better performance
        console.log('Found quizzes:', quizzes);
            
        return NextResponse.json({ success: true, quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        return NextResponse.json({ 
            success: false, 
            error: "Failed to fetch quizzes",
            details: error.message 
        }, { status: 500 });
    }
}
