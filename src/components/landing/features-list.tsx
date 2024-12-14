import React from 'react'
import FeaturesCard from './FeaturesCard'

const data = [
    {
        title: "01. Dynamic Fourms",
        description1: "Join diverse forums to discuss various topics, share your thoughts, and connect with others.",
        description2: "Start new threads and participate in existing discussions to foster a vibrant community.",
        banner:"/img1.png",
    },
    {
        title: "02. Interactive Threads",
        description1: "Publish thread posts to share knowledge, insights, and important updates with the community.",
        description2: "Engage with thread posts by commenting and interacting with authors and other readers.",
        banner:"/img2.png",
    },
    {
        title: "03. User Profiles",
        description1: "Create a personalized profile to showcase your interests and connect with like-minded individuals.",
        description2: "Easily track your forum posts, comments, and blog contributions in one place.",
        banner:"/img3.png",
    },
    
    {
        title: "04. Search and Discover",
        description1: "Use our powerful search tools to discover relevant threads and blog posts based on your interests.",
        description2: "Browse through different categories and tags to explore the rich content created by the community.",
        banner:"/img4.png",
    },
    {
        title: "05. Notifications and Updates",
        description1: "Receive notifications about new forum threads, blog posts, and comments to stay updated on community activities.",
        description2: "Get real-time updates on discussions and announcements that matter to you.",
        banner:"/soon.png",
    },
]

const Announcement = () => {
    return (
        <div className=' px-5 py-8 lg:px-10 xl:px-16 lg:py-6 flex flex-col gap-12'>
            <div className=' flex flex-col gap-20'>

                <FeaturesCard class="md:flex-row" title={data[0].title} description1={data[0].description1} description2={data[0].description2} banner={data[0].banner} />
                
                <FeaturesCard class="md:flex-row-reverse" title={data[1].title} description1={data[1].description1} description2={data[1].description2} banner={data[1].banner} />

                <FeaturesCard class="md:flex-row" title={data[2].title} description1={data[2].description1} description2={data[2].description2} banner={data[2].banner} />

                <FeaturesCard class="md:flex-row-reverse" title={data[3].title} description1={data[3].description1} description2={data[3].description2} banner={data[3].banner} />

                <FeaturesCard class="md:flex-row" title={data[4].title} description1={data[4].description1} description2={data[4].description2} banner={data[4].banner} />

            </div>
        </div>
    )
}

export default Announcement