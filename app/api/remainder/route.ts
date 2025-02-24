import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server'; //grab the username and password
import prisma from '@/lib/prisma';

//pagination
const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  //validate
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  //search pagination
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const query = searchParams.get('query') || '';

  //how to search in post table
  try {
    const posts = await prisma.post.findMany({
      where: {
        id:parseInt(userId),
        title: {
          contains: query,
          mode: 'insensitive', //case sensitivity
        },
      },
      orderBy: { created: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const AllPosts = await prisma.post.count({
      where: {
        id:parseInt(userId),
        title: {
          contains: query,
          mode: 'insensitive', //case sensitivity
        },
      },
    });

    const totalPosts = Math.ceil(AllPosts / ITEMS_PER_PAGE);

    return NextResponse.json({ posts, currentPage: page, totalPosts });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
        { status: 500 }
    )
  }
}
