// Copyright © 2024 Navarrotech

// Redux
import { useSelector } from "@/store"

type Props = {
    label?: string
    className?: string
    isFullwidth?: boolean

    value?: string
    onChange?: (value: string) => void
}

export default function RecipeChooser(props: Props){
    const { onChange, label, isFullwidth = false, className="", value, ...rest } = props

    const recipesById = useSelector(state => state.recipes.byId)
    const recipeKeys = Object.keys(recipesById)

    let fullwidthClass = isFullwidth ? ' is-fullwidth' : ''

    return <div className={`field ${className} ${fullwidthClass}`}>
        <label className="label">{ label }</label>
        <div className={`control ${fullwidthClass}`}>
            <div className={`select ${fullwidthClass}`}>
                <select
                    { ...rest }
                    className={`${fullwidthClass}`}
                    onChange={(e) => onChange?.(e.target.value)}
                    value={value}
                >{
                    recipeKeys.map(id => {
                        const recipe = recipesById[id]
                        return <option key={id} value={id}>{ recipe.title }</option>
                    })    
                }</select>
            </div>
        </div>
    </div>
}
