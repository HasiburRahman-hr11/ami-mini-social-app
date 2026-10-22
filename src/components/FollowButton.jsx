/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../api/users";

export default function FollowButton({
  userId,
  initialFollowing = false,
  onChange,
  isFullWidthMob
}) {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(initialFollowing);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing, userId]);

  const mutation = useMutation({
    mutationFn: async (shouldFollow) => {
      return shouldFollow ? followUser(userId) : unfollowUser(userId);
    },

    onMutate: async (shouldFollow) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      const previousFollowing = following;
      setFollowing(shouldFollow);

      return { previousFollowing };
    },

    onSuccess: (_data, shouldFollow) => {
      onChange?.(shouldFollow);

      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },

    onError: (error, _shouldFollow, context) => {
      setFollowing(context?.previousFollowing ?? false);
      console.error(
        "Follow/unfollow failed:",
        error.response?.data || error.message,
      );
    },
  });

  const handleClick = () => {
    if (mutation.isPending) return;

    mutation.mutate(!following);
  };

  return (
    <Button
      variant={following ? "outlined" : "contained"}
      onClick={handleClick}
      disabled={mutation.isPending}
      sx={{
        width:{xs:isFullWidthMob ? "100%" : "auto", sm:"auto"}
      }}
    >
      {mutation.isPending ? "Loading..." : following ? "Unfollow" : "Follow"}
    </Button>
  );
}
