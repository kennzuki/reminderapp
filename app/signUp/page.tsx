import { SignUp, useSignIn, useSignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Page() {
  return <SignUp />;
}
