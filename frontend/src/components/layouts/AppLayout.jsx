import React from 'react'
import Header from '../shared/Header'
import Footer from '../shared/footer'

const AppLayout = () =>(WrappedComponent)=> {
    const WithLayout=(props)=>{
        return (
            <>
            <Header />
            <WrappedComponent />
            <Footer />
            </>
        )
    }
    WithLayout.displayName = `WithLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithLayout;
}

export default AppLayout