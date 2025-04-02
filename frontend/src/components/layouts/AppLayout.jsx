import React from 'react'
import Header from '../shared/Header'
import Footer from '../shared/footer'
import { cn } from '../../libs/utils'

const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        return (
            <div className="flex flex-col min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                <Header />
                <main className="flex-grow w-full mx-auto transition-all duration-300 mt-6 px-4 md:container pt-6 md:pt-8 pb-12 overflow-x-hidden">
                    <div className={cn(
                        "w-full animate-fadeIn",
                        "relative z-10 rounded-xl"
                    )}>
                        <WrappedComponent {...props} />
                    </div>
                </main>
                <Footer />
            </div>
        )
    }
    WithLayout.displayName = `WithLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithLayout;
}

export default AppLayout