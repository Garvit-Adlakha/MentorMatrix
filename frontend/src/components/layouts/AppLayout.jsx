import React from 'react'
import Header from '../shared/Header'
import Footer from '../shared/footer'

const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {

        //bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background to-background"
        return (
            <div className="flex flex-col min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                    <Header />
                <main className="flex-grow w-full mx-auto transition-all duration-300 md:container overflow-x-hidden mt-26">
                    <div className="w-full animate-fadeIn relative z-10 rounded-xl ">
                        <WrappedComponent {...props} />
                    </div>
                </main>
            </div>
        )
    }

    // Preserve the display name for debugging purposes
    WithLayout.displayName = `WithLayout(${getComponentName(WrappedComponent)})`;
    return WithLayout;
}

// Helper function to get component name
const getComponentName = (Component) => {
    return Component.displayName || Component.name || 'Component';
}

export default AppLayout