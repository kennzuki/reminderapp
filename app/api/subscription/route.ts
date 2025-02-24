import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; //grab the username and password
import prisma from '@/lib/prisma';

export async function POST() {
  const { userId } = auth();

  //validate
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  //capture payment
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            isSubscribed: true,
            subsscriptionEnds: true,
        }
    });
    //validate user
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        //subscription
    const subscriptionEnds =new Date()
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)
    //update the value
    const updatedUser= await prisma.user.update({
      where: { id: userId },
        data: {
            isSubscribed: true,
            subsscriptionEnds: subscriptionEnds,
        },
    });
    //success
    return NextResponse.json({ message: 'Payment processed successfully',subscriptionEnds:updatedUser.subsscriptionEnds });
    } catch (error) {
        console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
        { status: 500 }
    )
    }
    
    
}
export async function GET() {
    //find user
    const { userId } = auth()
    //validate
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    //
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isSubscribed: true,
                subsscriptionEnds: true,
            },
           
        })
        //validate user
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
//find if the user field  is active now       
        const now = new Date();

        if (user.isSubscribed && user.subsscriptionEnds < now) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isSubscribed: false,
                        subsscriptionEnds:null
                },
            })
            return NextResponse.json({isSubscribed: false, subsscriptionEnds: null});
        }
        return NextResponse.json({ isSubscribed: user.isSubscribed, subscriptionEnds: user.subsscriptionEnds });

    } catch (error) {
         console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
        { status: 500 }
    )
    }
}
