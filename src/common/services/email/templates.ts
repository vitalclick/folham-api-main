export const waitlistConfirmation = (from: string, link: string) => ({
  text: `
    Hey, hey

    Thank you for being one of our first - and bound to be one of our greatest - fans. 

    We are stoked you tossed your name onto the waitlist and can’t wait to get this advertising party of the century started. 

    Here’s the thing: to make your A-list status OFFICIAL, we need you to do one more simple thing and click on this link to verify your email. 

    This helps us keep our list legit and chalked full of the coolest of cool peeps. (We ain’t want no spammers scrubs.)  

    ${link}

    Keep your eyes peeled on your inbox because we’ve got more coming your way. App-a-teasers anyone? (See what we did there?) 


    P.S. Are you also a podcaster? Then be sure to claim your podcast for free. All of that and a bag of chips right here. 

    P.P.S. Make sure you whitelist this email, so you don't miss out on the fun! If you use Gmail, simply move this to your "primary" folder, or add ${from} to your contacts on Outlook.
  `,
  html: `
    <div>
    <p>
    Hey, hey
    </p>
    
    <p>
    Thank you for being one of our first - and bound to be one of our greatest - fans. 
    </p>
    
    <p>
    We are stoked you tossed your name onto the waitlist and can’t wait to get this advertising party of the century started. 
    </p>
    <p>
    Here’s the thing: to make your A-list status OFFICIAL, we need you to do one more simple thing and click on this link to verify your email. 
    </p>
    <p>
    This helps us keep our list legit and chalked full of the coolest of cool peeps. (We ain’t want no spammers scrubs.)  
    </p>
    
    <a href="${link}" rel="noreferrer" target="_blank">${link}</a>
    
    <p>
    Keep your eyes peeled on your inbox because we’ve got more coming your way. App-a-teasers anyone? (See what we did there?) 
    </p>
    
    <p>
    P.S. Are you also a podcaster? Then be sure to claim your podcast for free. All of that and a bag of chips right here. 
    </p>
    <p>
    P.P.S. Make sure you whitelist this email, so you don't miss out on the fun! If you use Gmail, simply move this to your "primary" folder, or add ${from} to your contacts on Outlook.
    </p>
    </div>
  `,
});

export const formatContactUs = (message) => ({
  text: `${message}`,
  html: `
    <div>
    <p>
    ${message}
    </p>
    </div>
  `,
});
