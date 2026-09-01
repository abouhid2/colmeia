Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resource :household, only: %i[ show update ]
      resources :members, only: %i[ index create update destroy ]
      resources :tasks, only: %i[ index create update destroy ] do
        post :complete, on: :member
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
