import Main from '../components/shared/Main'
import AppLayout from '../components/layouts/AppLayout'
const HomePage = () => {
  return (
    <div>
      <Main />
    </div>
  )
}
HomePage.layoutClassName = "landing-theme";
HomePage.mainClassName = "landing-main";
HomePage.contentClassName = "landing-content";

export default AppLayout()(HomePage)