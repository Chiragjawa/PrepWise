"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

function Header() {

    const path=usePathname();
    useEffect(()=>{
        console.log(path)
    },[])

  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
        <Image src={'/logo.png'} width={100} height={100} alt='logo' />
        <ul className='hidden md:flex gap-6'>
          <Link href={"/dashboard"}>
            <li className={`hover:text-primary hover:font-bold transition-all
            cursor-pointer
            ${path=='/dashboard'&&'text-primary font-bold'}
            `}
            
            >Dashboard</li>
            </Link>
            
            {/* <li className={`hover:text-primary hover:font-bold transition-all
            cursor-pointer
            // ${path=='/dashboard/questions'&&'text-primary font-bold'}
            // `}>Resume Checker</li> */}
              <Link href={"https://resume-checker-psi-roan.vercel.app/"}>
            <li className={`hover:text-primary hover:font-bold transition-all
            cursor-pointer
            `}>Resume-Checker</li>
            </Link>
            {/* <li className={`hover:text-primary hover:font-bold transition-all
            cursor-pointer
            ${path=='/dashboard/how'&&'text-primary font-bold'}
            `}>How it Works?</li> */}
        </ul>
        <UserButton/>
    </div>
  )
}

export default Header
