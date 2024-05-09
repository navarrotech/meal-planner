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
import Dropzone from "./components/Dropzone";
import Button from "@/common/Button";

// Iconography & styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from './calendar.module.sass'

const isMobile = () => window.innerWidth < 768
const getDayCount = () => isMobile() ? 1 : 7

export default function MealPlanLayout(){
    
    const [ date, setDate ] = useState<typeof moment>( moment().startOf(isMobile() ? "day" : "week") )
    const lastDayOfWeek = date.clone().add(getDayCount() - 1, 'days')

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
                            <div className="block buttons is-right has-addons is-centered-mobile">
                                <Button onClick={() => setDate(date.clone().subtract(getDayCount(), 'days'))}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                    </span>
                                </Button>
                                <Button onClick={() => setDate(date.clone().add(getDayCount(), 'days'))}>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </span>
                                </Button>
                            </div>
                        </div>
                        <div className="block pt-3">
                            <div className="block columns is-gapless">{
                                Array.apply(0, Array(getDayCount())).map((_, index) => {
                                    const day: typeof moment = date.clone().add(index, 'days')

                                    const isToday = day.isSame(moment(), 'day')
                                    const isPast = day.isBefore(moment(), 'day')

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
        <AddToDropzone />
    </section>
}
