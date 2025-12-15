"use client"

import * as React from "react"

interface BusinessContextType {
    isBusinessSwitching: boolean
    setIsBusinessSwitching: (loading: boolean) => void
}

const BusinessContext = React.createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
    const [isBusinessSwitching, setIsBusinessSwitching] = React.useState(false)

    return (
        <BusinessContext.Provider value={{ isBusinessSwitching, setIsBusinessSwitching }}>
            {children}
        </BusinessContext.Provider>
    )
}

export function useBusiness() {
    const context = React.useContext(BusinessContext)
    if (context === undefined) {
        throw new Error("useBusiness must be used within a BusinessProvider")
    }
    return context
}
