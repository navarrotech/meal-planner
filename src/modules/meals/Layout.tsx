// Copyright © 2024 Navarrotech

// React.js
import { useState } from "react";

// Data
import moment from 'moment'

// Components
import EditPlannedMeal from "./components/EditPlannedMeal";
import RecipeList from "@/modules/recipes/components/RecipesList";
import AddRecipe from "../recipes/components/AddRecipe";
import Dropzone from "./components/Dropzone";
import Button from "@/common/Button";

// Iconography & styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from './calendar.module.sass'

const daysArray = Array.apply(0, Array(7))

export default function MealPlanLayout(){
    
    const [ date, setDate ] = useState<typeof moment>( moment().startOf("week") )
    const lastDayOfWeek = date.clone().add(6, 'days')

    return <section className="section">
        <div className={"container " + styles.container}>
            <div className="block columns">
                
                {/* Known meal choosers */}
                <div className="column is-one-fifth">
                    <div className="block box">
                        <RecipeList />
                    </div>
                    <AddRecipe />
                </div>

                {/* Calendar */}
                <div className="column is-four-fifths">
                    <div className="block box">
                        <div className="block level">
                            <h1 className="title">
                                <span>{ date.format("MMMM Do") }</span>
                                <span className="icon is-small px-4 mx-1">
                                    <FontAwesomeIcon icon={faArrowRight} size="xs" />
                                </span>
                                <span>{ lastDayOfWeek.format("MMMM Do YYYY") }</span>
                            </h1>
                            <div className="block buttons is-right has-addons">
                                <Button onClick={() => setDate(date.clone().subtract(7, 'days'))}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                    </span>
                                </Button>
                                <Button onClick={() => setDate(date.clone().add(7, 'days'))}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </span>
                                </Button>
                            </div>
                        </div>
                        <div className="block pt-3">
                            <div className="block columns is-gapless">{
                                daysArray.map((_, index) => {
                                    const day: typeof moment = date.clone().add(index, 'days')

                                    const isToday = day.isSame(moment(), 'day')
                                    const isPast = day.isBefore(moment(), 'day')

                                    return <div
                                        className={"column " + (isPast ? "is-disabled" : "")}
                                        key={index + day.toISOString()}
                                    >
                                        <div className="has-text-centered">
                                            <h1 className={`title is-size-5 ${(isToday ? " has-text-primary has-text-weight-bold" : "")}`}>{ day.format("MMMM Do") }</h1>
                                            <h2 className={`subtitle is-size-6 ${(isToday ? " has-text-primary has-text-weight-bold" : "")}`}>{ day.format("dddd") }</h2>
                                        </div>
                                        <hr />
                                        <div>
                                            <Dropzone date={day} type="breakfast" />
                                            <Dropzone date={day} type="lunch" />
                                            <Dropzone date={day} type="dinner" />
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
    </section>
}
