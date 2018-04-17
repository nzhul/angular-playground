using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))] // in order for this to work we must add it as services.AddScoped<LogUserActivity>();
    [Authorize]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly IDatingRepository _repository;
        private readonly IMapper _mapper;
        public UsersController(IDatingRepository repository, IMapper mapper)
        {
            this._mapper = mapper;
            this._repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var dbUser = await _repository.GetUser(currentUserId);

            userParams.UserId = currentUserId;

            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = dbUser.Gender == "male" ? "female" : "male";
            }

            var users = await this._repository.GetUsers(userParams);

            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);

            Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await this._repository.GetUser(id);

            var userToReturn = _mapper.Map<UserForDetailedDto>(user);

            return Ok(userToReturn);
        }

        //api/users/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserForUpdateDto userForUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var dbUser = await _repository.GetUser(id);

            if (dbUser == null)
            {
                return NotFound($"Could not find user with id of {id}");
            }

            if (currentUserId != dbUser.Id)
            {
                return Unauthorized();
            }

            _mapper.Map(userForUpdateDto, dbUser);

            if (await _repository.SaveAll())
            {
                return NoContent();
            }

            //TODO: this will throw an error when we try to update without changing anything.
            throw new Exception($"Updating user {id} failed on save");

        }

        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var like = await _repository.GetLike(id, recipientId);
            if (like != null)
            {
                return BadRequest("You already liked this user");
            }

            if (await _repository.GetUser(recipientId) == null)
            {
                return NotFound();
            }

            like = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };

            _repository.Add<Like>(like);

            if (await _repository.SaveAll())
            {
                return Ok(new {}); // hack to fix angular error because it is expecting object.
            }

            return BadRequest("Failed to add user");
        }
    }
}