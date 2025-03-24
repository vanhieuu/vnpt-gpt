import { lightColors, darkColors } from "./Color";
import { useColorScheme } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react"

export const ThemeContext = createContext({
    dark: false,
    colors: lightColors,
    setScheme: (color:string)=>{}
})

export const ThemeProvider = (props:any) => {
    const colorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(colorScheme == "dark");

    useEffect(()=>{
        setIsDark(colorScheme == "dark");
    },[colorScheme])

    const defaultTheme = {
        dark: isDark,
        colors: isDark ? darkColors : lightColors,
        setScheme: (scheme:string)=>setIsDark(scheme === "dark")
    } as any
    return (
        <ThemeContext.Provider  value={defaultTheme} >
            {props.children}
        </ThemeContext.Provider>
    )
}

export const useTheme = ()=>useContext(ThemeContext)