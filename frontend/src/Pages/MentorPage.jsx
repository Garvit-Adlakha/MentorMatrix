import React from 'react'
import AppLayout from '../components/layouts/AppLayout'
import Mentor from '../components/Mentor'

const MentorPage = () => {
  return (
    <Mentor />
  )
}

export default AppLayout()(MentorPage)