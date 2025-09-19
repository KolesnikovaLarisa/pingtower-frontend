const Footer = () => {
  return (
    <footer className="py-8 bg-steelGrad text-white">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-sm font-inter">© 2025 PingTower. Все права защищены.</span>
          </div>
          <div className="text-sm font-inter">
            <a href="mailto:support@pingtower.app" className="underline hover:text-lightGray transition-colors">support@pingtower.app</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer



