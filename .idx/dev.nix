{ pkgs, ... }: {

  # NOTE: This is an excerpt of a complete Nix configuration example.
  # For more information about the dev.nix file in Firebase Studio, see
  # https://firebase.google.com/docs/studio/customize-workspace

  # Enable previews and customize configuration
  idx.previews = {
    enable = true;
    previews = {
      # The following object sets web previews
      web = {
        command = [
          "npm"
          "run"
          "start" # This script in package.json is 'next start --port 9002'
          "--" # Separator for npm to pass subsequent args to the script
          "--port" # Next.js argument for port
          "$PORT"  # $PORT is provided by the environment
        ];
        manager = "web";
        # Optionally, specify a directory that contains your web app
        # cwd = "app/client";
      };
      # The following object sets Android previews
      # Note that this is supported only on Flutter workspaces
      # android = {
      #   manager = "flutter";
      # };
    };
  };
}
