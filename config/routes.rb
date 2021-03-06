Helloblock::Application.routes.draw do
  root to: "application#index"

  post "/email" => "application#save_email"

  # Static Assets normally served before this
  # By the time it hits this, it's too late, unfound
  get "/templates" => "application#unfound_assets"
  get "/templates/*all" => "application#unfound_assets"

  # All other routes to redirect to angular
  get "*path" => "application#index"
end
