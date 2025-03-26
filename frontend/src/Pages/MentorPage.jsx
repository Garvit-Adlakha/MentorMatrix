import React from 'react'
import AppLayout from '../components/layouts/AppLayout'
import FacultyCards from '../components/FacultyCards'

const MentorPage = () => {
  return (
    <>
    <FacultyCards />
    </>
  )
}

export default AppLayout()(MentorPage)