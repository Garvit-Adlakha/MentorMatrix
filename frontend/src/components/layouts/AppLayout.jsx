import React from 'react'
import Header from '../shared/Header'
import Footer from '../shared/footer'

const AppLayout = () =>(WrappedComponent)=> {
    const WithLayout=(props)=>{
        return (
            <>
            <Header />
            <div className='h-[calc(100vh-6rem)]'>
            <WrappedComponent />
            </div>
            <Footer />
            </>
        )
    }
    WithLayout.displayName = `WithLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithLayout;
}

export default AppLayout