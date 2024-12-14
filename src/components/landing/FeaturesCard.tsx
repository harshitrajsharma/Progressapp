import React from 'react'
import Image from 'next/image'

// Define the props interface
interface FeaturesCardProps {
  class?: string;
  title: string;
  description1: string;
  description2: string;
  banner: string;
}

const FeaturesCard: React.FC<FeaturesCardProps> = (props) => {
  return (
    <div className={` flex flex-col-reverse gap-6 ${props.class} `}>
      <div className=' md:w-3/5 flex flex-col gap-2 justify-center items-center px-16'>
        <h1 className=' text-center text-4xl md:text-6xl '>{props.title}</h1>
        <p className=' text-xl text-center'>{props.description1}</p>
        <p className=' text-xl text-center'>{props.description2}</p>
      </div>
      <div className=' md:w-2/5 bg-gradient-to-r from-primary-200 to-secondary-200 p-6 rounded-3xl '>
        <div className=' flex w-full h-full justify-center bg-white rounded-3xl items-center p-4 '>

          <Image src={props.banner} className=' object-cover w-full h-full' alt="banner" />

        </div>
      </div>
    </div>
  )
}

export default FeaturesCard