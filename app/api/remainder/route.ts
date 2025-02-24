import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; //grab the username and password
import prisma from '@/lib/prisma';