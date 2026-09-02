Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Public: everything reachable with nothing but the invite code.
      resources :households, only: %i[ create show ], param: :invite_code do
        # A sandbox colmeia for whoever has no invite and no colmeia yet.
        post :demo, on: :collection
        member do
          post :claim
          post :join
        end
      end

      # Scoped to the X-Household-Code header.
      resource :household, only: %i[ show update ], controller: "current_household" do
        post :reseed
      end
      resources :members, only: %i[ index create update destroy ]
      resources :tasks, only: %i[ index create update destroy ] do
        post :complete, on: :member
        post :reopen, on: :member
      end
      resources :completions, only: %i[ index ] do
        post :review, on: :member
      end
      resources :shopping_items, only: %i[ index create update destroy ] do
        delete :purchased, on: :collection, action: :clear_purchased
      end
      resources :goals, only: %i[ index create update destroy ]
      resources :seasons, only: %i[ index create update destroy ] do
        member do
          post :close
          post :reopen
        end
        # Voting opens when the estação closes: who was the Pernilongo of it.
        resource :votes, only: %i[ show update destroy ], controller: "season_title_votes"
      end
      resources :season_titles, only: %i[ index create update destroy ]
      # Every vote of the colmeia, for the titles listed on a profile.
      resources :season_title_votes, only: %i[ index ]
      resources :achievement_awards, only: %i[ index create ]
    end
  end
end
