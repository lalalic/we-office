export default {
    account_user:graphql`
        fragment qili_account_user on User{
            id
            photo
            username
        }
    `,
    profile_user:graphql`
		fragment qili_profile_user on User{
			id
			username
			birthday
			gender
			location
			photo
			signature
		}
	`,
    comment:graphql`
        fragment qili_comment on Comment{
            id
            content
            type
            createdAt
            author{
                id
                name
                photo
            }
            isOwner
        }
    `,
}
