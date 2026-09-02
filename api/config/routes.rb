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
    end
  end
end
