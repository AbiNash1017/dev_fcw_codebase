import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        await adminAuth.verifyIdToken(token);

        // Mock data for now
        return NextResponse.json({
            Sessions: [
                {
                    category: "Yoga",
                    Slot: [
                        {
                            time: new Date().toISOString(),
                            Booking: {
                                id: 1,
                                total_price: 500,
                                Users: {
                                    first_name: "John",
                                    last_name: "Doe",
                                    orders: []
                                }
                            }
                        }
                    ]
                }
            ]
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching booking history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
