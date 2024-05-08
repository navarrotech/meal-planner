// Copyright © 2024 Navarrotech

// React.js
import { useEffect, useRef, useState } from "react";

// Typescript
import type { DatesSetArg } from "@fullcalendar/core/index.js";

// Data
import { useMealPlans } from "./hooks";
import moment from 'moment'

// Third party calendar
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

// Components
import RecipeList from "@/modules/recipes/components/RecipesList";
import AddRecipe from "../recipes/components/AddRecipe";
import Loader from "@/common/Loader";
import './calendar.sass'

const plugins = [ timeGridPlugin ]

const defaultDate = (): string[] => [
    moment().format("YYYY"),
    moment().format("MMM"),
    moment().format("DD")
]

export default function VideoLayout(){
    
    const calendarRef = useRef<FullCalendar>(null)
    const [ dates, setDates ] = useState<string[]>(defaultDate())

    const [ year, month, startDay ] = dates
    const meals = useMealPlans(year, month, startDay);

    useEffect(() => {
        if (!calendarRef.current){
            return;
        }

        const calendar = calendarRef.current.getApi();

        function onDateChanged(event: DatesSetArg){
            const date = moment(event.start)

            setDates([
                date.format("YYYY"),
                date.format("MMM"),
                date.format("DD")
            ])
        }

        calendar.on("datesSet", onDateChanged)

        return () => {
            calendar.off("datesSet", onDateChanged)
        }
    }, [ calendarRef ])

    if (meals === null) {
        return <section className="section">
            <div className="container is-max-fullhd">
                <Loader />
            </div>
        </section>
    }

    return <section className="section">
        <div className="container is-fluid">
            <div className="block columns">
                
                {/* Known meal choosers */}
                <div className="column is-one-quarters">
                    <div className="block box">
                        <RecipeList />
                    </div>
                    <AddRecipe />
                </div>

                {/* Calendar */}
                <div className="column is-three-quarters">
                    <div className="block box">
                        <FullCalendar
                            // Ref for the calendar API, for events:
                            ref={calendarRef}
                            // Core
                            plugins={plugins}
                            initialView='timeGridWeek'
                            weekends={true}
                            // Show a bar of when "now" is
                            now={moment().format()}
                            nowIndicator={true}
                            // Render "events" from the database
                            events={meals}
                            eventContent={renderEventContent}
                            // Only show hours between 6am and 10pm
                            slotMinTime="06:00:00"
                            // Hide the "all day" stuff
                            allDaySlot={false}
                            // Styling:
                            height="auto"
                        />
                    </div>
                </div>
                
            </div>
        </div>
    </section>
}

function renderEventContent(eventInfo: any) {
    console.log({ eventInfo })
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    )
}
