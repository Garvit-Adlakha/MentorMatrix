import React from 'react'
import AppLayout from '../components/layouts/AppLayout'
import Mentor from '../components/Mentor/Mentor'

const MentorPage = () => {
  return (
    <Mentor />
  )
}

MentorPage.layoutClassName = "landing-theme";

export default AppLayout()(MentorPage)