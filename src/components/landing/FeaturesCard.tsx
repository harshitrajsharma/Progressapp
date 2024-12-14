import React from 'react'
import Image from 'next/image'

function FeaturesCard() {
  return (
    <div className={` flex flex-col gap-6 `}>
      <div className=' md:w-full bg-gradient-to-r from-primary-200 to-secondary-200 p-6 rounded-3xl '>
        <div className=' flex flex-col w-full h-full justify-center bg-blue-500/20 rounded-3xl items-center p-2 md:p-8 '>
          <div className=' md:w-full flex flex-col gap-2 justify-center items-center mb-12 '>
            <h1 className=' sm:text-3xl lg:text-6xl xl:text-7xl tracking-tight text-center text-4xl md:text-4xl font-bold '><span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500 animate-gradient'>Smart Components</span> for You</h1>
          </div>
          <div>
            <Image
              src="/1st.png"
              alt="banner"
              width={500}
              height={300}
              layout="responsive"
              className='object-cover rounded-t-2xl'
            />
            <Image
              src="/2nd.png"
              alt="banner"
              width={500}
              height={300}
              layout="responsive"
              className='object-cover'
            />
            <Image
              src="/3rd.png"
              alt="banner"
              width={500}
              height={300}
              layout="responsive"
              className='object-cover'
            />
            <Image
              src="/4th.png"
              alt="banner"
              width={500}
              height={300}
              layout="responsive"
              className='object-cover rounded-b-2xl'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesCard