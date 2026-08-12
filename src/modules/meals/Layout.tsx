// Copyright © 2024 Navarrotech

// React.js
import { useState } from "react";

// Data
import moment from 'moment'

// Components
import EditPlannedMeal from "./components/EditPlannedMeal";
import RecipeList from "@/modules/recipes/components/RecipesList";
import AddToDropzone from "./components/AddToDropzone";
import AddRecipe from "../recipes/components/AddRecipe";
import ShoppingList from "./components/ShoppingList";
import Dropzone from "./components/Dropzone";
import Button from "@/common/Button";

// Data
import { DAY_KEY_FORMAT, useMealPlansInRange } from "./hooks";

// Iconography & styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import styles from './calendar.module.sass'

const isMobile = () => window.innerWidth < 768
const getDayCount = () => isMobile() ? 1 : 7

export default function MealPlanLayout(){

    const [ date, setDate ] = useState<typeof moment>( moment().startOf(isMobile() ? "day" : "week") )
    const [ isShoppingListOpen, setShoppingListOpen ] = useState<boolean>(false)

    const dayCount = getDayCount()
    const lastDayOfWeek = date.clone().add(dayCount - 1, 'days')

    // The days on screen are subscribed once here rather than once per dropzone, so the
    // calendar and the shopping list are always describing the same meals.
    const mealsByDay = useMealPlansInRange(date, dayCount)
    const days: (typeof moment)[] = Array.from(
        { length: dayCount },
        (_, offset) => date.clone().add(offset, 'days')
    )

    // Every slot counts towards the shopping, including the ones the calendar cannot draw:
    // a snack planned from the CLI still needs buying.
    const mealsOnScreen = days.flatMap(
        (day) => Object.values(mealsByDay[day.format(DAY_KEY_FORMAT)] || {}).flat()
    )
    const mealsNeedingIngredients = mealsOnScreen.filter((meal) => meal.needsIngredients)

    return <section className="section">
        <div className={"container " + styles.container}>
            <div className="block columns">

                {/* Known meal choosers */}
                <div className="column is-one-fifth is-hidden-touch">
                    <div className="block box">
                        <RecipeList />
                    </div>
                    <AddRecipe />
                </div>

                {/* Calendar */}
                <div className="column is-four-fifths">
                    <div className="block box">
                        <div className="block level not-mobile">
                            <h1 className={`title is-size-3 has-text-centered-mobile`}>
                                <span>{ date.format("MMMM Do") }</span>
                                {
                                    !isMobile()
                                    ? <>
                                        <span className="icon is-small px-4 mx-1">
                                            <FontAwesomeIcon icon={faArrowRight} size="xs" />
                                        </span>
                                        <span>{ lastDayOfWeek.format("MMMM Do YYYY") }</span>
                                    </>
                                    : <>
                                        <br />
                                        <span className="is-size-5 has-text-weight-normal">{ lastDayOfWeek.format("dddd") }</span>
                                        {
                                            date.isSame(new Date(), "day")
                                                ? <span className="tag is-primary ml-2">Today</span>
                                                : <></>
                                        }
                                    </>
                                }
                            </h1>
                            <div className="block buttons is-right is-centered-mobile">
                                <Button
                                    color={mealsNeedingIngredients.length ? "warning" : "default"}
                                    onClick={() => setShoppingListOpen(true)}
                                >
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faCartShopping} />
                                    </span>
                                    <span>Shopping list</span>
                                    { mealsNeedingIngredients.length
                                        ? <span className="tag is-dark ml-2">{ mealsNeedingIngredients.length }</span>
                                        : <></>
                                    }
                                </Button>
                                <div className="buttons has-addons ml-3">
                                    <Button onClick={() => setDate(date.clone().subtract(dayCount, 'days'))}>
                                        <span className="icon">
                                            <FontAwesomeIcon icon={faArrowLeft} />
                                        </span>
                                    </Button>
                                    <Button onClick={() => setDate(date.clone().add(dayCount, 'days'))}>
                                        <span className="icon">
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="block pt-3">
                            <div className="block columns is-gapless">{
                                days.map((day, index) => {
                                    const isToday = day.isSame(moment(), 'day')
                                    const isPast = day.isBefore(moment(), 'day')
                                    const dayMeals = mealsByDay[day.format(DAY_KEY_FORMAT)]

                                    return <div
                                        className={"column " + (isPast ? "is-disabled" : "")}
                                        key={index + day.toISOString()}
                                    >
                                        <div className="has-text-centered is-hidden-touch">
                                            <h1 className={`title is-size-5 ${(isToday ? " has-text-primary has-text-weight-bold" : "")}`}>{ day.format("MMMM Do") }</h1>
                                            <h2 className={`subtitle is-size-6 ${(isToday ? " has-text-primary has-text-weight-bold" : "")}`}>{ day.format("dddd") }</h2>
                                        </div>
                                        <hr className="is-hidden-touch" />
                                        <div>
                                            <Dropzone date={day} type="breakfast" plannedMeals={dayMeals?.breakfast || []} />
                                            <Dropzone date={day} type="lunch" plannedMeals={dayMeals?.lunch || []} />
                                            <Dropzone date={day} type="dinner" plannedMeals={dayMeals?.dinner || []} />
                                        </div>
                                    </div>
                                })
                            }</div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
        <EditPlannedMeal />
        <AddToDropzone />
        { isShoppingListOpen
            ? <ShoppingList
                meals={mealsOnScreen}
                onClose={() => setShoppingListOpen(false)}
            />
            : <></>
        }
    </section>
}
