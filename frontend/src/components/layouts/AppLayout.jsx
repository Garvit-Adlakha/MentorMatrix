import React from 'react'
import Header from '../shared/Header'
import Footer from '../shared/footer'
import { motion } from 'motion/react'

const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        return (
            <div className="flex flex-col min-h-screen bg-[background]">
                <Header />
                <motion.main 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-grow w-full mx-auto transition-all duration-300 md:container overflow-x-hidden pt-20 pb-10"
                >
                    <div className="w-full animate-fadeIn relative z-10 rounded-xl px-3 sm:px-0">
                        <WrappedComponent {...props} />
                    </div>
                </motion.main>
                {/* <Footer /> */}
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