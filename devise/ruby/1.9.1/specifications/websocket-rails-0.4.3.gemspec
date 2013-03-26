# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "websocket-rails"
  s.version = "0.4.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Dan Knox", "Kyle Whalen", "Three Dot Loft LLC"]
  s.date = "2013-03-13"
  s.description = "Seamless Ruby on Rails websocket integration."
  s.email = ["dknox@threedotloft.com"]
  s.executables = ["thin-socketrails"]
  s.files = ["bin/thin-socketrails"]
  s.homepage = "http://danknox.github.com/websocket-rails/"
  s.post_install_message = "  Welcome to WebsocketRails v0.4.3!\n\n  There have been a few significant changes in the public\n  API, so if you are upgrading please be sure to read the\n  CHANGELOG located at:\n\n  http://github.com/DanKnox/websocket-rails/CHANGELOG.md\n"
  s.require_paths = ["lib"]
  s.rubyforge_project = "websocket-rails"
  s.rubygems_version = "1.8.25"
  s.summary = "Plug and play websocket support for ruby on rails. Includes event router for mapping javascript events to controller actions."

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<rails>, [">= 0"])
      s.add_runtime_dependency(%q<rack>, [">= 0"])
      s.add_runtime_dependency(%q<faye-websocket>, [">= 0"])
      s.add_runtime_dependency(%q<thin>, [">= 0"])
      s.add_runtime_dependency(%q<redis>, [">= 0"])
      s.add_runtime_dependency(%q<hiredis>, [">= 0"])
      s.add_runtime_dependency(%q<em-synchrony>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<rspec-rails>, [">= 0"])
      s.add_development_dependency(%q<rspec-matchers-matchers>, [">= 0"])
    else
      s.add_dependency(%q<rails>, [">= 0"])
      s.add_dependency(%q<rack>, [">= 0"])
      s.add_dependency(%q<faye-websocket>, [">= 0"])
      s.add_dependency(%q<thin>, [">= 0"])
      s.add_dependency(%q<redis>, [">= 0"])
      s.add_dependency(%q<hiredis>, [">= 0"])
      s.add_dependency(%q<em-synchrony>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<rspec-rails>, [">= 0"])
      s.add_dependency(%q<rspec-matchers-matchers>, [">= 0"])
    end
  else
    s.add_dependency(%q<rails>, [">= 0"])
    s.add_dependency(%q<rack>, [">= 0"])
    s.add_dependency(%q<faye-websocket>, [">= 0"])
    s.add_dependency(%q<thin>, [">= 0"])
    s.add_dependency(%q<redis>, [">= 0"])
    s.add_dependency(%q<hiredis>, [">= 0"])
    s.add_dependency(%q<em-synchrony>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<rspec-rails>, [">= 0"])
    s.add_dependency(%q<rspec-matchers-matchers>, [">= 0"])
  end
end
